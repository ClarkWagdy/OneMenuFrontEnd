import { strings } from '@/config/localization/LocalizedStrings'
import React from 'react'
import classes from './NoItems.module.css'
import NoItemsSvg  from './noItems.svg'
export default function NoItems() {
  return (
    <div className={classes.noItemsContain}>
    <NoItemsSvg/>
    {strings.NoItems}
    </div>

  )
}
