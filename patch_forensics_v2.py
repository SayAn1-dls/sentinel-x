import re
import os

def patch_file(path, content_updater):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r') as f:
        content = f.read()
    new_content = content_updater(content)
    with open(path, 'w') as f:
        f.write(new_content)
    print(f"Patched: {path}")

def update_mock(content):
    if 'instructionPrefetchForensics' in content:
        return content
    
    # 1. Add to imports
    content = content.replace('analyzeASLRForensics } from', 'analyzeASLRForensics, analyzeInstructionPrefetchForensics } from')
    
    # 2. Add variable definition
    var_def = """
  const instructionPrefetchForensics = {
    ...analyzeInstructionPrefetchForensics(),
    isPrefetchSideChannelDetected: Math.random() > 0.99,
    isSpeculativeCodeExecutionObserved: Math.random() > 0.995,
    instructionCachePressureScore: Math.random() * 0.2
  };
"""
    content = content.replace('const cfiForensics = {', var_def + '\n  const cfiForensics = {')
    
    # 3. Add to return object
    content = content.replace('forensics: {', 'forensics: {\n      instructionPrefetchForensics,')
    
    return content

def update_scorer(content):
    if 'instruction_prefetch_forensics' in content:
        return content
        
    # Add to DEFAULT_WEIGHTS
    content = content.replace('"aslr_forensics": 1.90,', '"aslr_forensics": 1.90,\n    "instruction_prefetch_forensics": 1.95,')
    
    return content

# Paths
paths = {
    'mock': ['repo/src/lib/mock-forensics.ts', 'repo/frontend/src/lib/mock-forensics.ts'],
    'scorer': 'repo/src/modules/threat_scorer.py'
}

for p in paths['mock']: patch_file(p, update_mock)
patch_file(paths['scorer'], update_scorer)
