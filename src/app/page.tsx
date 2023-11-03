import Image from 'next/image' 
import HeadPage from './head'
 
import styles from './page.module.css'
 

export default function Home() {
  return (

<>
<HeadPage/>
<main className={styles.main  }>
      <div className={styles.description}>
       <h2>Clark</h2>
      </div>
    </main>

</>
 
  )
}
