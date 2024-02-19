import styles from './page.module.css';

export default function Custom404(){
    return(
        <main className={styles.not_found_container}>
            <div>
                <img style={{justifyContent:'center', alignContent: 'center', alignItems:'center'}} src='favicon.ico'/>
                <p>404: Page not found</p>
            </div>
        </main>
    )
}