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

# Update calculateAdvancedRiskScore parameters
for path in ['src/lib/forensic-engine.ts', 'frontend/src/lib/forensic-engine.ts']:
    patch_file(path,
               r'(instructionPrefetchForensics\?: InstructionPrefetchForensics;)',
               r'\1 dramRowhammerForensics?: DRAMRowhammerForensics;')

# Update calculateAdvancedRiskScore scoring logic (at the end before return)
scoring_logic = """
  // v58 DRAM Rowhammer Logic
  if (params.dramRowhammerForensics) {
    if (params.dramRowhammerForensics.isRowhammerBitFlipDetected) score += 100;
    if (params.dramRowhammerForensics.isHammeringPatternObserved) score += 85;
    score += (params.dramRowhammerForensics.dramRefreshRateJitterNs / 10);
    score += params.dramRowhammerForensics.memoryControllerPressureScore * 30;
  }
"""

for path in ['src/lib/forensic-engine.ts', 'frontend/src/lib/forensic-engine.ts']:
    patch_file(path,
               r'(return { score, level };)',
               scoring_logic + r'\n  \1')

print("Patching logic complete.")
