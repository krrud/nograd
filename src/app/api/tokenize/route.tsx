import { NextRequest, NextResponse } from "next/server";
import natural from 'natural';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const text = body.text;

        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(text);

        return NextResponse.json({ tokens });
    } catch (error) {
        console.error('Error tokenizing text:', error);
        return NextResponse.json({ error: "Failed to tokenize text" }, {status: 500});
    }
}

async function fetchTokens(text: string): Promise<string[]> {
  try {
      const response = await fetch('/api/tokenize', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({text})
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.tokens;
  } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
  }
}