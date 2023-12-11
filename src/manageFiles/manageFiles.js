import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, Button } from '@nextui-org/react'
import styles from '../css/manageFiles.module.css'

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
    // Perform logic to download the file using its fileId or filename
    // For example:
    axios({
      url: `${API_BASE_URL}/download/${fileId}`, // Adjust the endpoint for file download
      method: 'GET',
      responseType: 'blob', // Set the response type to blob for file download
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
        // Handle error scenarios or display an error message
        console.error('Error downloading file:', error.message)
      })
  }

  function handleDeleteFile(fileId) {
    // Perform logic to delete the file based on its fileId
    axios
      .delete(`${API_BASE_URL}/files/${fileId}`)
      .then((response) => {
        // Handle success message or update UI upon successful deletion
        console.log('File deleted successfully')
        // Update the files state to remove the deleted file from the UI
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
      })
      .catch((error) => {
        // Handle error scenarios or display an error message
        console.error('Error deleting file:', error.message)
      })
  }

  function handleToggleShared(fileId, currentSharedStatus) {
    // Perform logic to toggle the shared status of the file based on its fileId
    const newSharedStatus = !currentSharedStatus // Toggle the shared status
    axios
      .put(`${API_BASE_URL}/files/toggleShare/${fileId}`, {
        shared: newSharedStatus,
      })
      .then((response) => {
        // Handle success message or update UI upon successful status toggle
        console.log('Shared status updated successfully')
        // Update the files state or UI to reflect the updated shared status
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId ? { ...file, shared: newSharedStatus } : file
          )
        )
      })
      .catch((error) => {
        // Handle error scenarios or display an error message
        console.error('Error updating shared status:', error.message)
      })
  }

  return (
    <div className={styles.gridContainer}>
      {files.map((file) => (
        <div key={file.id} className={styles.gridItem}>
          <Card>
            {/* Display file information */}
            <div className={styles.cardHeader}>
              <h3>{file.original_filename}</h3>
            </div>
            <div className={styles.cardMiddle}>
              <p>Uploaded at: {file.uploaded_at}</p>
              <p>Size: {file.size} MB</p>
              <p>Shared: {file.shared ? 'Yes' : 'No'}</p>
              <p>
                {isOwner(file.uploaded_by)
                  ? 'You are the owner'
                  : 'You are not the owner'}
              </p>
            </div>
            <div className={styles.cardBottom}>
              {/* Add buttons for download, delete, toggle shared status */}
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
                className={styles.button} // Apply the CSS class
              >
                Delete
              </Button>
              {isOwner(file.uploaded_by) && (
                <Button
                  onClick={() => handleToggleShared(file.id, file.shared)}
                  className={styles.button} // Apply the CSS class
                >
                  Toggle Shared
                </Button>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

export default ManageFiles
