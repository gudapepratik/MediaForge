import React, { useState } from 'react'
import { ButtonGroup } from './ui/button-group'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { fetchFeed, setSearchParam } from '../store/feedSlice'

function SearchBar() {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();

  const handleSearch = () => {
    dispatch(setSearchParam(query))
    dispatch(fetchFeed()) // refetch the feed
  }

  return (
      <ButtonGroup className={'w-full '}>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className={'text-sm rounded-2xl'}/>
        <Button onClick={handleSearch} variant="outline" aria-label="Search ">
          <Search />
        </Button>
      </ButtonGroup>
  )
}

export default SearchBar