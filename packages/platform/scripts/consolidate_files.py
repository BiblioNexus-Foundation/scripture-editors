import os

# Array of relative file paths
paths = [
    "../README.md",
    "../src",
    "../../shared/nodes/features",
    "../../shared/nodes/scripture",
    "../../shared-react/adaptors",
    "../../shared-react/annotation",
    "../../shared-react/nodes",
    "../../shared-react/plugins",
]

# Name of the output markdown file
output_file = "project_files.md"

def get_all_files(path):
    if os.path.isfile(path):
        return [path]
    elif os.path.isdir(path):
        file_list = []
        for root, _, files in os.walk(path):
            for file in files:
                file_list.append(os.path.join(root, file))
        return file_list
    else:
        print(f"Warning: Path not found: {path}")
        return []

def get_language(file_path):
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    language_map = {
        '': 'Dockerfile',
        '.py': 'python',
        '.js': 'javascript',
        '.html': 'html',
        '.css': 'css',
        '.java': 'java',
        '.cpp': 'cpp',
        '.hpp': 'cpp',
        '.h': 'cpp',
        '.cs': 'cs',
        '.c': 'c',
        '.rb': 'ruby',
        '.php': 'php',
        '.swift': 'swift',
        '.go': 'go',
        '.rs': 'rust',
        '.ts': 'typescript',
        '.tsx': 'typescript',  # Added TSX mapping
        '.jsx': 'javascript',  # Added JSX mapping for completeness
        '.sh': 'bash',
        '.md': 'markdown',
        '.json': 'json',
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml',  # Added YAML alternative extension
        '.sql': 'sql',
        # Add more mappings as needed
    }
    return language_map.get(ext, 'text')

def consolidate_files(paths, output_file):
    with open(output_file, 'w') as outfile:
        for path in paths:
            files = get_all_files(path)
            for file_path in files:
                try:
                    with open(file_path, 'r') as infile:
                        # Write the file name
                        newText = f"# {file_path}\n\n" + f"```{get_language(file_path)}\n" + infile.read() + "\n```\n\n"
                        outfile.write(newText)

                        # outfile.write(f"# {file_path}\n\n")

                        # # Determine the language and write the file contents
                        # language = get_language(file_path)
                        # outfile.write(f"```{language}\n")
                        # outfile.write(infile.read())
                        # outfile.write("\n```\n\n")
                # except UnicodeDecodeError:
                    #outfile.write(f"Unable to read file: {file_path}. It may be a binary file.")
                except Exception as e:
                    #outfile.write(f"Error reading file: {file_path}. Error: {str(e)}")
                    print(f"Error reading file: {file_path}. Error: {str(e)}")

# Run the consolidation function
consolidate_files(paths, output_file)

print(f"Consolidation complete. Output written to {output_file}")
