FROM ubuntu:22.04

RUN apt-get update
RUN apt-get install -y curl ruby ruby-dev make gcc g++ libxml2-dev libxslt1-dev
RUN gem install bundler
RUN bundle config build.nokogiri --use-system-libraries

COPY Gemfile /blog/
WORKDIR /blog
RUN bundle install

COPY . /blog
WORKDIR /blog

ENTRYPOINT bundle exec jekyll serve -H 0.0.0.0 --unpublished
