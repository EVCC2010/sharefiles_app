import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, Button } from '@nextui-org/react'
import styles from '../css/dashboard.module.css'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState({
    uploadedFiles: 0,
    storageUsed: 0,
    sharedFiles: 0,
  })

  const [error, setError] = useState('')
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSummaryData(response.data)
      } catch (error) {
        console.error('Error fetching summary data:', error.message)
        setError('Failed to fetch summary data')
      }
    }
    fetchSummaryData()
  }, [])

  const handleFileUpload = async () => {
    try {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.onchange = async () => {
        const file = fileInput.files[0]
        const formData = new FormData()
        formData.append('file', file)

        const token = localStorage.getItem('token')

        try {
          await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          })
          // Refresh summary data after successful file upload
          // fetchSummaryData()
        } catch (error) {
          console.error('Error uploading file:', error.message)
        }
      }

      // Append file input to the document body before triggering click
      document.body.appendChild(fileInput)
      fileInput.click()

      // Remove the file input from the DOM after file selection
      fileInput.remove()
    } catch (error) {
      console.error('Error handling file upload:', error.message)
    }
  }

  const redirectToManageFiles = () => {
    window.location.href = '/manageFiles'
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridItem}>
        <Card>
          <div className={styles.cardHeader}>
            <h3># Files</h3>
          </div>
          <div className={styles.cardMiddle}>
            <p>{summaryData.uploadedFiles} Files</p>
          </div>
          <div className={styles.cardBottom}>
            <p>Number of files uploaded</p>
          </div>
        </Card>
      </div>

      <div className={styles.gridItem}>
        <Card>
          <div className={styles.cardHeader}>
            <h3>Storage Used</h3>
          </div>
          <div className={styles.cardMiddle}>
            <p>{summaryData.storageUsed} MB</p>
          </div>
          <div className={styles.cardBottom}>
            <p>Size of Files uploaded</p>
          </div>
        </Card>
      </div>

      <div className={styles.gridItem}>
        <Card>
          <div className={styles.cardHeader}>
            <h3># Shared Files</h3>
          </div>
          <div className={styles.cardMiddle}>
            <p>{summaryData.sharedFiles} Files</p>
          </div>
          <div className={styles.cardBottom}>
            <p>Number of files shared with others</p>
          </div>
        </Card>
        {error && <p>Error: {error}</p>}
      </div>

      <div className={styles.gridItem}>
        <Card>
          <div className={styles.cardOptions}>
            <Button onClick={handleFileUpload} variant="contained">
              Upload Files
            </Button>
            <Button onClick={redirectToManageFiles} variant="contained">
              Manage Uploaded Files
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
