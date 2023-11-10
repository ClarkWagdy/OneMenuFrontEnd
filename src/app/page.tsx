import Image from 'next/image' 
import HeadPage from './head'
 
import styles from './page.module.css'
 

export default function Home() {


  
  return (

<>
<HeadPage/>
<main className={styles.Home  }>
 
<Image   src="/wlogo.svg" width={500} height={500} alt="All in One Chip"  />

   
    </main>

</>
 
  )
}
