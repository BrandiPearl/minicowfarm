/**
 * Minimal Gmail SMTP client for Cloudflare Workers (cloudflare:sockets).
 * Import of cloudflare:sockets is intentionally hidden from webpack.
 */

type Socket = {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  opened: Promise<unknown>;
  closed: Promise<unknown>;
  close: () => Promise<void>;
  startTls?: (options?: { expectedServerHostname?: string }) => void | Promise<void>;
};

async function connectTls(host: string, port: number): Promise<Socket> {
  // Avoid static `import("cloudflare:sockets")` so Next webpack can compile.
  const load = new Function("specifier", "return import(specifier)") as (
    specifier: string,
  ) => Promise<{ connect: (opts: { hostname: string; port: number; secureTransport?: string }) => Socket }>;
  const { connect } = await load("cloudflare:sockets");
  const socket = connect({
    hostname: host,
    port,
    secureTransport: port === 465 ? "on" : "starttls",
  });
  await socket.opened;
  if (port !== 465 && socket.startTls) {
    await socket.startTls({ expectedServerHostname: host });
  }
  return socket;
}

function encodeBase64(value: string) {
  return btoa(value);
}

async function readLine(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  buffer: { text: string },
): Promise<string> {
  const decoder = new TextDecoder();
  while (true) {
    const idx = buffer.text.indexOf("\n");
    if (idx >= 0) {
      const line = buffer.text.slice(0, idx).replace(/\r$/, "");
      buffer.text = buffer.text.slice(idx + 1);
      return line;
    }
    const { value, done } = await reader.read();
    if (done) throw new Error("SMTP connection closed unexpectedly");
    buffer.text += decoder.decode(value, { stream: true });
  }
}

async function readReply(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  buffer: { text: string },
): Promise<{ code: number; lines: string[] }> {
  const lines: string[] = [];
  while (true) {
    const line = await readLine(reader, buffer);
    lines.push(line);
    if (line.length >= 4 && line[3] === " ") {
      const code = Number(line.slice(0, 3));
      if (!Number.isFinite(code)) throw new Error(`Bad SMTP reply: ${line}`);
      return { code, lines };
    }
  }
}

async function writeLine(writer: WritableStreamDefaultWriter<Uint8Array>, line: string) {
  const encoder = new TextEncoder();
  await writer.write(encoder.encode(line + "\r\n"));
}

async function expect(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  buffer: { text: string },
  ok: number | number[],
  context: string,
) {
  const wanted = Array.isArray(ok) ? ok : [ok];
  const reply = await readReply(reader, buffer);
  if (!wanted.includes(reply.code)) {
    throw new Error(`${context}: expected ${wanted.join("/")} got ${reply.code} (${reply.lines.join(" | ")})`);
  }
  return reply;
}

export async function sendMailViaCloudflareSockets(options: {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<void> {
  const socket = await connectTls(options.host, options.port);
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const buffer = { text: "" };

  try {
    await expect(reader, buffer, 220, "banner");
    await writeLine(writer, `EHLO minicowfarm`);
    await expect(reader, buffer, 250, "EHLO");

    await writeLine(writer, "AUTH LOGIN");
    await expect(reader, buffer, 334, "AUTH LOGIN");
    await writeLine(writer, encodeBase64(options.user));
    await expect(reader, buffer, 334, "username");
    await writeLine(writer, encodeBase64(options.pass));
    await expect(reader, buffer, 235, "password");

    const fromEmail = options.from.match(/<([^>]+)>/)?.[1] || options.from;
    await writeLine(writer, `MAIL FROM:<${fromEmail}>`);
    await expect(reader, buffer, 250, "MAIL FROM");
    await writeLine(writer, `RCPT TO:<${options.to}>`);
    await expect(reader, buffer, [250, 251], "RCPT TO");
    await writeLine(writer, "DATA");
    await expect(reader, buffer, 354, "DATA");

    const headers = [
      `From: ${options.from}`,
      `To: ${options.to}`,
      options.replyTo ? `Reply-To: ${options.replyTo}` : null,
      `Subject: ${options.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      `Content-Transfer-Encoding: 8bit`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@${fromEmail.split("@")[1] || "minicowfarm.com"}>`,
    ]
      .filter(Boolean)
      .join("\r\n");

    const body = options.text.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
    await writer.write(new TextEncoder().encode(`${headers}\r\n\r\n${body}\r\n.\r\n`));
    await expect(reader, buffer, 250, "message body");
    await writeLine(writer, "QUIT");
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
    try {
      writer.releaseLock();
    } catch {
      /* ignore */
    }
    try {
      await socket.close();
    } catch {
      /* ignore */
    }
  }
}

export function isCloudflareWorkerRuntime() {
  return (
    typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair !== "undefined" ||
    typeof (globalThis as { CloudFlare?: unknown }).CloudFlare !== "undefined" ||
    !!(process.env.CF_PAGES || process.env.CF_WORKER || process.env.WORKER)
  );
}
