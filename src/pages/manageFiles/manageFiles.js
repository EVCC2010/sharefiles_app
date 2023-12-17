import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, Button } from '@nextui-org/react'
import styles from '../../css/manageFiles.module.css'
import Banner from '../../components/banner'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const ManageFiles = () => {
  const [files, setFiles] = useState([])
  const [sharedFilter, setSharedFilter] = useState(true)
  const [userId, setUserId] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    const fetchUserInfo = async () => {
      try {
        if (token) {
          const response = await axios.get(`${API_BASE_URL}/userinfo`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const { userId, isAdmin } = response.data
          setUserId(userId)
          setUserRole(isAdmin ? 'admin' : 'user')
          fetchFiles(userId, sharedFilter)
        }
      } catch (error) {
        console.error('Error fetching user info:', error.message)
      }
    }

    fetchUserInfo()
  }, [sharedFilter])

  const fetchFiles = async (userId, shared) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/files/${userId}?shared=${shared}`
      )
      setFiles(response.data)
    } catch (error) {
      console.error('Error fetching files:', error.message)
    }
  }

  const isOwner = (fileUserId) => {
    return fileUserId === userId
  }

  const canDelete = () => {
    return userRole === 'admin'
  }

  function handleDownloadFile(fileId, filename) {
    axios({
      url: `${API_BASE_URL}/download/${fileId}`,
      method: 'GET',
      responseType: 'blob',
    })
      .then((response) => {
        // Create a link element to initiate the download
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        // Cleanup
        link.parentNode.removeChild(link)
      })
      .catch((error) => {
        console.error('Error downloading file:', error.message)
      })
  }

  // Setting for banner
  const [message, setMessage] = useState('')

  function handleDeleteFile(fileId) {
    axios
      .delete(`${API_BASE_URL}/files/${fileId}`)
      .then((response) => {
        console.log('File deleted successfully')
        setMessage('File Successfully Deleted!')
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
      })
      .catch((error) => {
        console.error('Error deleting file:', error.message)
        setMessage('Error deleting file')
      })
  }

  function handleToggleShared(fileId, currentSharedStatus) {
    const newSharedStatus = !currentSharedStatus // Toggle the shared status
    axios
      .put(`${API_BASE_URL}/files/toggleShare/${fileId}`, {
        shared: newSharedStatus,
      })
      .then((response) => {
        console.log('Shared status updated successfully')
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId ? { ...file, shared: newSharedStatus } : file
          )
        )
      })
      .catch((error) => {
        console.error('Error updating shared status:', error.message)
      })
  }

  return (
    <div>
      {message && <Banner message={message} />}
      <div className={styles.gridContainer}>
        {files.map((file) => (
          <div key={file.id} className={styles.gridItem}>
            <Card>
              <div className={styles.cardHeader}>
                <h3>{file.original_filename}</h3>
              </div>
              <div className={styles.cardMiddle}>
                <p>Uploaded at: {file.uploaded_at}</p>
                <p>Size: {file.size} MB</p>
                <p>
                  Shared:{' '}
                  <span
                    className={file.shared ? 'text-green-500' : 'text-red-500'}
                  >
                    {file.shared ? 'Yes' : 'No'}
                  </span>
                </p>
                <p>
                  {isOwner(file.uploaded_by)
                    ? 'You are the owner'
                    : 'You are not the owner'}
                </p>
              </div>
              <div className={styles.cardBottom}>
                <Button
                  onClick={() =>
                    handleDownloadFile(file.id, file.original_filename)
                  }
                  className={styles.button}
                >
                  Download
                </Button>
                <Button
                  onClick={() => handleDeleteFile(file.id)}
                  disabled={!canDelete()}
                  className={styles.button}
                >
                  Delete
                </Button>
                {isOwner(file.uploaded_by) && (
                  <Button
                    onClick={() => handleToggleShared(file.id, file.shared)}
                    className={styles.button}
                  >
                    Toggle Shared
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManageFiles
