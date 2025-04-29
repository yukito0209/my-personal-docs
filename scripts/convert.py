from markitdown import MarkItDown

md = MarkItDown(enable_plugins=False) # Set to True to enable plugins
result = md.convert(r"scripts\github-profile.md")
print(result.text_content)