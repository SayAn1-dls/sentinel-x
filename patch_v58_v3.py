import re
import os

def patch_file(path, search_pattern, replacement, flags=0):
    if not os.path.exists(path):
        return
    with open(path, 'r') as f:
        content = f.read()
    new_content = re.sub(search_pattern, replacement, content, flags=flags)
    with open(path, 'w') as f:
        f.write(new_content)

# Fix the mess I made in mock-forensics.ts
# First, remove the bad injection if it exists
for path in ['src/lib/mock-forensics.ts', 'frontend/src/lib/mock-forensics.ts']:
    with open(path, 'r') as f:
        content = f.read()
    # Remove the bad injection
    content = re.sub(r'dramRowhammerForensics: {.*?},[\s\n]*const aslrForensics = {', 'const aslrForensics = {', content, flags=re.DOTALL)
    with open(path, 'w') as f:
        f.write(content)

# Now inject it correctly as a variable and in the return object
mock_var = """  const dramRowhammerForensics = {
    isRowhammerBitFlipDetected: Math.random() > 0.998,
    dramRefreshRateJitterNs: Math.random() * 50,
    memoryControllerPressureScore: Math.random() * 0.4,
    isTargetRowRefreshActive: true,
    adjacentRowActivationCount: Math.floor(Math.random() * 200000),
    isHammeringPatternObserved: false,
  };"""

for path in ['src/lib/mock-forensics.ts', 'frontend/src/lib/mock-forensics.ts']:
    # Inject variable after aslrForensics declaration
    patch_file(path,
               r'(aslrIntegrityScore: 0.95 \+ \(Math.random\(\) \* 0.05\)\n  };)',
               r'\1\n' + mock_var)
    
    # Inject into the return object
    patch_file(path,
               r'(aslrForensics,)',
               r'\1\n      dramRowhammerForensics,')

print("Mock patching corrected.")
