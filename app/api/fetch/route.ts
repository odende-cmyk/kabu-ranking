import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function GET(): Promise<Response> {
  const result = await new Promise<{
    ok: boolean;
    output: string;
  }>((resolve) => {
    exec("npx tsx scripts/fetch-yahoo.ts && npx tsx scripts/fetch-us.ts", (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          output: stderr || error.message,
        });
        return;
      }

      resolve({
        ok: true,
        output: stdout,
      });
    });
  });

  if (!result.ok) {
    return NextResponse.json(
      { status: "error", error: result.output },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ok",
    result: result.output,
  });
}