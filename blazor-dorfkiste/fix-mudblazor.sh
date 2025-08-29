#!/bin/bash

# Fix MudList components
find src/DorfkisteBlazor.Server -name "*.razor" -exec sed -i '' \
  's/<MudList Dense="true"/<MudList T="string" Dense="true"/g' {} \;

# Fix MudListItem components with Href
find src/DorfkisteBlazor.Server -name "*.razor" -exec sed -i '' \
  's/<MudListItem Href=/<MudListItem T="string" Value="@(\"item\")" Href=/g' {} \;

echo "MudBlazor components fixed"