import React from 'react'
import classes from './Copyright.module.css'
export default function Copyright() {
  return (
    <div className={classes.Copyright}>
        <p> Copyright © {new Date().getFullYear()}</p>
        <a >
            <img src='/blogo.svg' width={'35px'} alt="One"/>
        </a>
        </div>
  )
}
