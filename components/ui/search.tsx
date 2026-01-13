import { SearchIcon } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";

const Search = () => {
  return (
    <div className="flex items-center gap-2">
      <Input className="border-border rounded-full" placeholder="Pesquisar" />
      <Button className="h-10 w-10 rounded-full">
        <SearchIcon />
      </Button>
    </div>
  );
};

export default Search;
