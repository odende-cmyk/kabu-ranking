import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function GET() {
  return new Promise((resolve) => {
    exec("npx tsx scripts/fetch-all.ts", (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        resolve(
          NextResponse.json({ status: "error", error: stderr })
        );
        return;
      }

      resolve(
        NextResponse.json({ status: "ok", result: stdout })
      );
    });
  });
}