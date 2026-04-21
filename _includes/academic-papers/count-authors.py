#!/usr/bin/env python3

import yaml
from collections import defaultdict

def count_authors(yaml_file):
    with open(yaml_file, 'r') as file:
        papers = yaml.safe_load(file)

    author_counts = defaultdict(int)
    for paper in papers:
        authors_str = paper['authors']
        authors = [a.strip() for a in authors_str.split(',')]
        for author in authors:
            author_counts[author] += 1

    return dict(author_counts)

authors = count_authors('academic-papers-bpf.yaml')
for k, v in authors.items():
    print("%d %s" % (v, k))
