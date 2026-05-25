import base64, sys, os, json

def write_file(path, content):
    os.makedirs(os.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f'Written: {path}')

if __name__ == '__main__':
    path = sys.argv[1]
    encoded = sys.argv[2]
    content = base64.b64decode(encoded).decode('utf-8')
    write_file(path, content)