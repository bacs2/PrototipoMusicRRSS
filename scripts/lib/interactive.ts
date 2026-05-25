import * as readline from "readline";

function createReader() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

export async function promptConfirm(query: string): Promise<boolean> {
  const rl = createReader();
  const answer = await question(rl, query);
  rl.close();
  return answer.trim().toLowerCase().startsWith("s");
}

export async function promptSelect(
  maxOptions: number
): Promise<number | "skip"> {
  const rl = createReader();

  while (true) {
    const answer = await question(
      rl,
      `Selecciona (1-${maxOptions}, s para saltar): `
    );
    const trimmed = answer.trim().toLowerCase();

    if (trimmed === "s") {
      rl.close();
      return "skip";
    }

    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 1 && num <= maxOptions) {
      rl.close();
      return num - 1;
    }

    console.log("  Entrada invalida. Intenta de nuevo.");
  }
}

export async function promptMultiSelect(
  maxOptions: number
): Promise<number[] | "skip"> {
  const rl = createReader();

  while (true) {
    const answer = await question(
      rl,
      `Selecciona albums a importar (ej: 1,3,5 o 1-5, s para saltar): `
    );
    const trimmed = answer.trim().toLowerCase();

    if (trimmed === "s") {
      rl.close();
      return "skip";
    }

    if (trimmed === "all") {
      rl.close();
      return Array.from({ length: maxOptions }, (_, i) => i);
    }

    const selected = new Set<number>();
    const parts = trimmed.split(",");
    let valid = true;

    for (const part of parts) {
      const p = part.trim();
      const rangeMatch = p.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (start >= 1 && end <= maxOptions && start <= end) {
          for (let i = start; i <= end; i++) {
            selected.add(i - 1);
          }
        } else {
          valid = false;
          break;
        }
      } else {
        const num = parseInt(p, 10);
        if (!isNaN(num) && num >= 1 && num <= maxOptions) {
          selected.add(num - 1);
        } else {
          valid = false;
          break;
        }
      }
    }

    if (valid && selected.size > 0) {
      rl.close();
      return [...selected].sort((a, b) => a - b);
    }

    console.log("  Entrada invalida. Intenta de nuevo.");
  }
}
