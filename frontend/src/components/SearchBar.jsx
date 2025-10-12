import React from 'react'
import { ButtonGroup } from './ui/button-group'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'

function SearchBar() {
  return (
      <ButtonGroup className={'w-full '}>
        <Input placeholder="Search..." className={'text-sm rounded-2xl'}/>
        <Button variant="outline" aria-label="Search ">
          <Search />
        </Button>
      </ButtonGroup>
  )
}

export default SearchBar