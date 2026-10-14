import os

def patch_file(filepath, search_str, insert_str, after=True):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        return False
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already patched
    check_str = insert_str.strip().split('\n')[0]
    if check_str in content:
        print(f"Skipping {filepath} (already patched or similar code exists)")
        return False
    
    pos = content.find(search_str)
    if pos == -1:
        print(f"Skipping {filepath} (search_str '{search_str}' not found)")
        return False
    
    if after:
        new_pos = pos + len(search_str)
        content = content[:new_pos] + insert_str + content[new_pos:]
    else:
        content = content[:pos] + insert_str + content[pos:]
        
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")
    return True

# 1. Types
for p in ['src/lib/forensic-types.ts', 'frontend/src/lib/forensic-types.ts']:
    patch_file(p, 'export interface L1DCacheForensics {', 
               '\nexport interface TAAForensics {\n  isTsxAsynchronousAbortDetected: boolean;\n  transactionAbortRateJitter: number;\n  isTsxForceAbortObserved: boolean;\n  tsxLeakedDataEntropy: number;\n  isTransactionalExecutionSideChannelLikely: boolean;\n}\n', after=False)
    patch_file(p, '  l1dCacheForensics?: L1DCacheForensics;', '\n  taaForensics?: TAAForensics;')

# 2. Engine - Definition
for p in ['src/lib/forensic-engine.ts', 'frontend/src/lib/forensic-engine.ts']:
    # Function Definition
    patch_file(p, 'export function analyzeL1DCacheForensics(): L1DCacheForensics {', 
               'export function analyzeTAAForensics(): TAAForensics {\n  const jitter = Math.random();\n  return {\n    isTsxAsynchronousAbortDetected: Math.random() > 0.99,\n    transactionAbortRateJitter: jitter,\n    isTsxForceAbortObserved: Math.random() > 0.98,\n    tsxLeakedDataEntropy: 0.65,\n    isTransactionalExecutionSideChannelLikely: jitter > 0.8\n  };\n}\n\n', after=False)
    
    # Risk Score Param (Note the space or lack thereof)
    if not patch_file(p, 'l1dCacheForensics?: L1DCacheForensics;', ' taaForensics?: TAAForensics;'):
        patch_file(p, 'l1dCacheForensics?: L1DCacheForensics', ' taaForensics?: TAAForensics;')
    
    # Risk Score Logic
    patch_file(p, '  if (params.l1dCacheForensics) {', 
               '\n  if (params.taaForensics) {\n    if (params.taaForensics.isTsxAsynchronousAbortDetected) score += 120;\n    if (params.taaForensics.isTransactionalExecutionSideChannelLikely) score += 95;\n    if (params.taaForensics.isTsxForceAbortObserved) score += 80;\n  }\n', after=False)

# 3. Mock
for p in ['src/lib/mock-forensics.ts', 'frontend/src/lib/mock-forensics.ts']:
    patch_file(p, 'MDSForensics, L1DCacheForensics', ', TAAForensics')
    patch_file(p, 'analyzeMDSForensics, analyzeL1DCacheForensics', ', analyzeTAAForensics')
    patch_file(p, 'const l1dCacheForensics = analyzeL1DCacheForensics();', '\n  const taaForensics = analyzeTAAForensics();')
    patch_file(p, 'sideChannelForensics', ',\n      taaForensics')

# 4. Scorer
patch_file('src/modules/threat_scorer.py', '"l1d_cache_forensics": 2.15,', '\n    "taa_forensics": 2.20,')

