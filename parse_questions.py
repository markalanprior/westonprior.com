"""Parse questions from docs/questions.md for Would You Rather game."""
import re

def main() -> None:
    with open('docs/questions.md', encoding='utf-8') as f:
        lines = f.readlines()

    questions = []
    for line in lines:
        line = line.strip()
        if not line or 'Would you rather' not in line:
            continue
        text = re.sub(r'^\d+\.\s*', '', line)
        if ' or ' not in text:
            continue
        match = re.match(r'Would you rather\s+(.+)\s+or\s+(.+)', text, re.I | re.DOTALL)
        if match:
            opt_a = match.group(1).strip()
            opt_b = match.group(2).strip()
            def cap(s: str) -> str:
                return s[0].upper() + s[1:] if s else s
            questions.append({
                'question': text,
                'optionA': cap(opt_a),
                'optionB': cap(opt_b)
            })

    def esc(s: str) -> str:
        return s.replace('\\', '\\\\').replace("'", "\\'")

    for q in questions:
        print(f"            {{ question: '{esc(q['question'])}', optionA: '{esc(q['optionA'])}', optionB: '{esc(q['optionB'])}' }},")


if __name__ == '__main__':
    main()
