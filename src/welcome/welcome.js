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

const Welcome = () => {
  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://banner2.cleanpng.com/20180320/hbq/kisspng-blue-square-triangle-dropbox-5ab0b8fb2cb514.5630102115215311311831.jpg"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md">Welcome to ShareFiles</p>
          <p className="text-small text-default-500">sharedfiles.com</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p>
          This is our secure file sharing hub. Effortlessly share, manage, and
          collaborate on files with our user-friendly platform. Our focus on
          security ensures your data remains protected while enabling seamless
          collaboration. Start sharing securely today!
        </p>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link showAnchorIcon href="/login">
          New user? Sign up here to begin sharing securely.
        </Link>
      </CardFooter>
    </Card>
  )
}

export default Welcome
