import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from '@nextui-org/react'
import styles from '../../css/welcome.module.css'

const deleteToken = () => {
  localStorage.removeItem('token')
}

const Welcome = () => {
  deleteToken()
  return (
    <div className={styles.card}>
      <Card className="max-w-[450px]">
        <CardHeader className="flex gap-3">
          <Image
            alt="nextui logo"
            height={40}
            radius="sm"
            src="https://banner2.cleanpng.com/20180320/hbq/kisspng-blue-square-triangle-dropbox-5ab0b8fb2cb514.5630102115215311311831.jpg"
            width={40}
            onError={(e) => {
              e.target.src = '/fallback-image.jpg'
            }}
          />
          <div className="flex flex-col">
            <p className="text-md">Welcome to ShareFiles</p>
            <p className="text-small text-default-500">sharedfiles.com</p>
          </div>
        </CardHeader>
        <Divider />
        <div className={styles.mainText}>
          <CardBody>
            <p>
              This is our secure file sharing hub. Effortlessly share, manage,
              and collaborate on files with our user-friendly platform. Our
              focus on security ensures your data remains protected while
              enabling seamless collaboration. Start sharing securely today!
            </p>
          </CardBody>
        </div>
        <Divider />
        <CardFooter>
          <Link
            showAnchorIcon
            href="/signup"
            target="_blank"
            rel="noopener noreferrer"
          >
            New user? Sign up here to begin sharing securely.
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Welcome
