import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';

// Pick a document
export async function pickDocument() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Document picking error:', error);
    return null;
  }
}

// Pick an image from the gallery
export async function pickImage() {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Gallery access permission is required!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Image picking error:', error);
    return null;
  }
}

// Take a photo
export async function takePhoto() {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Camera access permission is required!');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Photo capture error:', error);
    return null;
  }
}

// Download a file (legacy API)
export async function downloadFile(url: string, filename: string) {
  try {
    const fileUri = FileSystem.documentDirectory + filename;

    const result = await FileSystem.downloadAsync(url, fileUri);

    if (result && result.uri) {
      console.log('File downloaded:', result.uri);
      return result.uri;
    }
    return null;
  } catch (error) {
    console.error('File download error:', error);
    return null;
  }
}

// Share a file
export async function shareFile(fileUri: string) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      alert('The "Share" feature is not available on this device.');
      return;
    }

    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Error while trying to share:', error);
  }
}

// Upload a file to the server (mock function)
export async function uploadFile(fileUri: string) {
  try {
    console.log('Uploading file to the server:', fileUri);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { success: true, message: 'File uploaded successfully!' };
  } catch (error) {
    console.error('Server upload error:', error);
    return { success: false, message: 'Upload failed' };
  }
}
