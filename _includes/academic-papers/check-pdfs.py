#!/usr/bin/env python
import requests
import yaml

def check_url(url):
    try:
        response = requests.head(url, allow_redirects=True)
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type')
            if 'application/pdf' in content_type:
                return True, "URL points to a PDF file."
            else:
                return False, f"URL does not point to a PDF file. Content-Type: {content_type}"
        else:
            return False, f"URL returned status code: {response.status_code}"
    except requests.RequestException as e:
        return False, f"Request failed: {e}"

if __name__ == "__main__":
    with open('academic-papers-bpf.yaml', 'r') as file:
        data = yaml.safe_load(file)

    for entry in data:
        if entry.get('description') == '':
            continue

        url = entry.get('url')
        if url:
            is_pdf, message = check_url(url)
            if not is_pdf:
                print(f"URL: {url}")
                print(f"Status: {message}\n")
        else:
            print("URL not found in entry.")
