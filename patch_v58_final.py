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

# 1. Forensic Types - Ensure dramRowhammerForensics is in ForensicIntelligence
for path in ['src/lib/forensic-types.ts', 'frontend/src/lib/forensic-types.ts']:
    with open(path, 'r') as f:
        content = f.read()
    if 'dramRowhammerForensics?: DRAMRowhammerForensics;' not in content:
        content = re.sub(r'(aslrForensics\?: ASLRForensics;)', r'\1\n  dramRowhammerForensics?: DRAMRowhammerForensics;', content)
        with open(path, 'w') as f:
            f.write(content)

# 2. Forensic Engine - Add logic to calculateAdvancedRiskScore if missing
logic = """
  // v58 DRAM Rowhammer Logic
  if (params.dramRowhammerForensics) {
    if (params.dramRowhammerForensics.isRowhammerBitFlipDetected) score += 100;
    if (params.dramRowhammerForensics.isHammeringPatternObserved) score += 85;
    score += (params.dramRowhammerForensics.dramRefreshRateJitterNs / 10);
    score += params.dramRowhammerForensics.memoryControllerPressureScore * 30;
  }
"""

for path in ['src/lib/forensic-engine.ts', 'frontend/src/lib/forensic-engine.ts']:
    with open(path, 'r') as f:
        content = f.read()
    
    # Ensure parameter is present
    if 'dramRowhammerForensics?: DRAMRowhammerForensics;' not in content:
        content = re.sub(r'(instructionPrefetchForensics\?: InstructionPrefetchForensics;)', r'\1 dramRowhammerForensics?: DRAMRowhammerForensics;', content)
    
    # Ensure logic is present (before return)
    if 'v58 DRAM Rowhammer Logic' not in content:
        content = re.sub(r'(return { score, level };)', logic + r'\n  \1', content)
        
    with open(path, 'w') as f:
        f.write(content)

# 3. Mock Forensics - Ensure dramRowhammerForensics is generated and returned
mock_var = """  const dramRowhammerForensics = {
    isRowhammerBitFlipDetected: Math.random() > 0.998,
    dramRefreshRateJitterNs: Math.random() * 50,
    memoryControllerPressureScore: Math.random() * 0.4,
    isTargetRowRefreshActive: true,
    adjacentRowActivationCount: Math.floor(Math.random() * 200000),
    isHammeringPatternObserved: false,
  };"""

for path in ['src/lib/mock-forensics.ts', 'frontend/src/lib/mock-forensics.ts']:
    with open(path, 'r') as f:
        content = f.read()
    
    # Add variable if missing
    if 'const dramRowhammerForensics =' not in content:
        # Inject after temporalAnomaly or something similar that's common
        content = re.sub(r'(const temporalAnomaly = detectTemporalAnomaly\(timestamp\);)', r'\1\n' + mock_var, content)
    
    # Add to return object if missing
    if 'dramRowhammerForensics,' not in content:
        # Inject into forensics: { ... }
        content = re.sub(r'(forensics: {)', r'\1\n      dramRowhammerForensics,', content)
        
    with open(path, 'w') as f:
        f.write(content)

# 4. Instruction Prefetch - Ensure it's returned in frontend mock too (it was missing in my read)
for path in ['frontend/src/lib/mock-forensics.ts']:
    with open(path, 'r') as f:
        content = f.read()
    if 'instructionPrefetchForensics,' not in content:
        content = re.sub(r'(forensics: {)', r'\1\n      instructionPrefetchForensics,', content)
        # Also need the variable if missing
        if 'const instructionPrefetchForensics =' not in content:
             instr_var = """  const instructionPrefetchForensics = {
    isPrefetchSideChannelDetected: Math.random() > 0.99,
    isSpeculativeCodeExecutionObserved: Math.random() > 0.995,
    instructionCachePressureScore: Math.random() * 0.2,
    prefetchBufferStallRate: 0.04,
    prefetchInstructionAnomalyDetected: false
  };"""
             content = re.sub(r'(const temporalAnomaly = detectTemporalAnomaly\(timestamp\);)', r'\1\n' + instr_var, content)
        with open(path, 'w') as f:
            f.write(content)

print("Final patching complete.")
