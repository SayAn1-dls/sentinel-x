import os

def patch_file(path, old_content, new_content):
    if not os.path.exists(path):
        print(f"File {path} not found.")
        return
    with open(path, 'r') as f:
        content = f.read()
    if old_content in content:
        with open(path, 'w') as f:
            f.write(content.replace(old_content, new_content))
        print(f"Patched {path}")
    else:
        print(f"Content not found in {path}")

# 3. Update mock-forensics.ts (Fixing the failed ones)
# imports - flexible matching
import_taa = 'analyzeTAAForensics } from'
import_ssb = 'analyzeTAAForensics, analyzeSSBForensics } from'
patch_file('src/lib/mock-forensics.ts', import_taa, import_ssb)
patch_file('frontend/src/lib/mock-forensics.ts', import_taa, import_ssb)

# const call
call_taa = 'const taaForensics = analyzeTAAForensics();'
call_ssb = 'const taaForensics = analyzeTAAForensics();\n  const ssbForensics = analyzeSSBForensics();'
patch_file('src/lib/mock-forensics.ts', call_taa, call_ssb)
patch_file('frontend/src/lib/mock-forensics.ts', call_taa, call_ssb)

# return object
ret_taa = 'taaForensics\n    }'
ret_ssb = 'taaForensics,\n      ssbForensics\n    }'
patch_file('src/lib/mock-forensics.ts', ret_taa, ret_ssb)
patch_file('frontend/src/lib/mock-forensics.ts', ret_taa, ret_ssb)

