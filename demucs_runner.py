import sys, subprocess, os

if len(sys.argv) < 3:
    print("Usage: python3 demucs_runner.py <input.mp3> <output_dir>")
    sys.exit(1)

input_file = sys.argv[1]
output_dir = sys.argv[2]

# Run Demucs separation
subprocess.run([
    "demucs",
    "--two-stems", "vocals",  # or use: -n mdx_extra
    "-o", output_dir,
    input_file
])
