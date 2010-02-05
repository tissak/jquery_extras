require 'rubygems'
require 'sinatra'

get "/" do
  redirect "/index.html"
end

get "/javascript/dep/:name.js" do |name|
  sleep 1
  File.read("#{Dir.pwd}/public/javascript/dependency/#{name}.js")
end