import os

filepath = 'frontend/src/lib/mock-forensics.ts'
with open(filepath, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == '};' and len(new_lines) > 0 and new_lines[-1].strip() == '};':
        continue # Remove double closing
    new_lines.append(line)

content = "".join(new_lines)

# Ensure taaForensics is defined and returned
if 'const taaForensics' not in content:
    content = content.replace('const l1dCacheForensics = analyzeL1DCacheForensics();', 
                              'const l1dCacheForensics = analyzeL1DCacheForensics();\n  const taaForensics = analyzeTAAForensics();')

if 'taaForensics' not in content.split('forensics: {')[1]:
    content = content.replace('sideChannelForensics', 'sideChannelForensics,\n      taaForensics')

with open(filepath, 'w') as f:
    f.write(content)
