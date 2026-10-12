import os

scorer_path = 'src/modules/threat_scorer.py'
if os.path.exists(scorer_path):
    with open(scorer_path, 'r') as f:
        content = f.read()
    content = content.replace('aggregator_weight = 2.05', 'aggregator_weight = 2.10')
    if 'mds_risk' not in content:
        # Find where bhb_risk is handled and insert after it
        insertion = """
        # v60: MDS & Port Smash Forensics
        mds_forensics = report.get('mdsForensics', {})
        mds_risk = 0
        if mds_forensics.get('isZombieLoadDetected'): mds_risk += 110
        if mds_forensics.get('isRidlArtifactObserved'): mds_risk += 95
        if mds_forensics.get('isFalloutLeakDetected'): mds_risk += 100
        if mds_forensics.get('portSmashContentionFound'): mds_risk += 75
        total_risk += mds_risk
        """
        if 'total_risk += bhb_risk' in content:
            content = content.replace("total_risk += bhb_risk", "total_risk += bhb_risk" + insertion)
        else:
            # Fallback insertion
            content = content.replace("return total_risk", insertion + "\n        return total_risk")
            
    with open(scorer_path, 'w') as f:
        f.write(content)
    print(f"Updated {scorer_path}")
else:
    print(f"Scorer not found at {scorer_path}")
