#!/usr/bin/env python
import yaml
from jinja2 import Environment, FileSystemLoader

with open('academic-papers-bpf.yaml', 'r') as yaml_file:
	data = yaml.safe_load(yaml_file)
env = Environment(loader = FileSystemLoader('.'))
template = env.get_template('academic-papers-bpf.html.jinja')

papers = []
for index, entry in enumerate(data):
	if entry['description'] == '' or entry['url'] == '':
		continue
	entry['id'] = f"paper{index}"
	entry['area_labels'] = entry['areas']
	entry['areas'] = entry['areas'].split(' ')
	entry['nb_areas'] = len(entry['areas'])
	papers.append(entry)

with open('paper-labels.yaml', 'r') as yaml_file:
	labels = yaml.safe_load(yaml_file)

html_content = template.render(papers=papers, labels=labels)

with open("academic-papers-bpf.html", "w") as file:
	file.write(html_content)
