import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    pickDocument,
    pickImage,
    takePhoto,
    downloadFile,
    shareFile,
    uploadFile
} from '../shared/lib/fileService';

interface SavedFile {
    uri: string;
    name: string;
    type: string;
    uploadedAt: string;
}

interface FileManagerScreenProps {
    navigation: any;
}

export default function FileManagerScreen({ navigation }: FileManagerScreenProps) {
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<SavedFile[]>([]);
    const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');

    useEffect(() => {
        loadUploadedFiles();
    }, []);

    const loadUploadedFiles = async () => {
        try {
            const stored = await AsyncStorage.getItem('uploadedFiles');
            if (stored) {
                setUploadedFiles(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading files:', error);
        }
    };

    const saveUploadedFile = async (file: SavedFile) => {
        try {
            const updated = [...uploadedFiles, file];
            await AsyncStorage.setItem('uploadedFiles', JSON.stringify(updated));
            setUploadedFiles(updated);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    const deleteUploadedFile = async (index: number) => {
        try {
            const updated = uploadedFiles.filter((_, i) => i !== index);
            await AsyncStorage.setItem('uploadedFiles', JSON.stringify(updated));
            setUploadedFiles(updated);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handlePickDocument = async () => {
        const file = await pickDocument();
        if (file) {
            setSelectedFile(file);
        }
    };

    const handlePickImage = async () => {
        const image = await pickImage();
        if (image) {
            setSelectedFile(image);
        }
    };

    const handleTakePhoto = async () => {
        const photo = await takePhoto();
        if (photo) {
            setSelectedFile(photo);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Alert.alert('Error', 'Please select a file first');
            return;
        }

        setUploadLoading(true);
        const result = await uploadFile(selectedFile.uri);
        setUploadLoading(false);

        if (result.success) {
            await saveUploadedFile({
                uri: selectedFile.uri,
                name: selectedFile.name || 'Image',
                type: selectedFile.mimeType || 'image/*',
                uploadedAt: new Date().toISOString(),
            });

            Alert.alert('Success', result.message);
            setSelectedFile(null);
            setActiveTab('gallery');
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const handleDownload = async () => {
        setDownloadLoading(true);
        const fileUri = await downloadFile(
            'https://picsum.photos/400/300',
            `downloaded-${Date.now()}.jpg`
        );
        setDownloadLoading(false);

        if (fileUri) {
            await saveUploadedFile({
                uri: fileUri,
                name: `downloaded-${Date.now()}.jpg`,
                type: 'image/jpeg',
                uploadedAt: new Date().toISOString(),
            });

            Alert.alert('Success', 'File downloaded!');
            setActiveTab('gallery');
        } else {
            Alert.alert('Error', 'Failed to download file');
        }
    };

    const renderFile = ({ item, index }: { item: SavedFile; index: number }) => (
        <View className="mb-4 border-b border-gray-200 pb-4">
            <Text className="font-bold mb-1 text-base">{item.name}</Text>
            <Text className="text-xs text-gray-500 mb-3">
                {new Date(item.uploadedAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </Text>

            {item.type.startsWith('image') && (
                <Image
                    source={{ uri: item.uri }}
                    className="w-full h-48 bg-gray-200 mb-3"
                    resizeMode="cover"
                />
            )}

            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={() => shareFile(item.uri)}
                    className="flex-1 border border-black py-2 px-3 items-center"
                >
                    <Text className="text-xs font-medium">Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            'Delete File?',
                            item.name,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', onPress: () => deleteUploadedFile(index), style: 'destructive' },
                            ]
                        );
                    }}
                    className="flex-1 bg-black py-2 px-3 items-center"
                >
                    <Text className="text-white text-xs font-medium">Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-12 pb-4 px-4 border-b border-gray-300">
                <View className="flex-row justify-between items-center">
                    <Text className="text-3xl font-bold" style={{ fontFamily: 'serif' }}>
                        Files
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-base">← Back</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-gray-300">
                <TouchableOpacity
                    onPress={() => setActiveTab('upload')}
                    className={`flex-1 py-3 ${activeTab === 'upload' ? 'border-b-2 border-black' : ''}`}
                >
                    <Text className={`text-center text-sm font-medium ${activeTab === 'upload' ? 'text-black' : 'text-gray-500'}`}>
                        Upload
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('gallery')}
                    className={`flex-1 py-3 ${activeTab === 'gallery' ? 'border-b-2 border-black' : ''}`}
                >
                    <Text className={`text-center text-sm font-medium ${activeTab === 'gallery' ? 'text-black' : 'text-gray-500'}`}>
                        Gallery ({uploadedFiles.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1">
                {activeTab === 'upload' ? (
                    <View className="p-4">
                        {/* Превью */}
                        {selectedFile && (
                            <View className="mb-6 border border-gray-300 p-3">
                                <Text className="font-bold mb-2 text-sm">Chose File</Text>
                                <Text className="text-xs text-gray-600 mb-3">
                                    {selectedFile.name || 'Image'}
                                </Text>
                                {selectedFile.uri && selectedFile.mimeType?.startsWith('image') && (
                                    <Image
                                        source={{ uri: selectedFile.uri }}
                                        className="w-full h-48 bg-gray-200"
                                        resizeMode="cover"
                                    />
                                )}
                            </View>
                        )}

                        {/* Выбор файла */}
                        <Text className="text-base font-bold mb-3">Chose File</Text>

                        <View className="flex-row gap-2 mb-4">
                            <TouchableOpacity
                                onPress={handlePickImage}
                                className="flex-1 border border-black py-3 px-2"
                            >
                                <Text className="text-center text-xs font-medium">Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleTakePhoto}
                                className="flex-1 border border-black py-3 px-2"
                            >
                                <Text className="text-center text-xs font-medium">Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handlePickDocument}
                                className="flex-1 border border-black py-3 px-2"
                            >
                                <Text className="text-center text-xs font-medium">Document</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Действия */}
                        <View className="border-t border-gray-300 pt-4 mt-4">
                            <TouchableOpacity
                                onPress={handleUpload}
                                disabled={uploadLoading || !selectedFile}
                                className={`py-3 px-4 mb-3 ${!selectedFile || uploadLoading ? 'border border-gray-300 bg-gray-100' : 'bg-black'}`}
                            >
                                {uploadLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text className={`text-center text-sm font-bold ${!selectedFile ? 'text-gray-400' : 'text-white'}`}>
                                        Upload File to the server
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDownload}
                                disabled={downloadLoading}
                                className={`border border-black py-3 px-4 ${downloadLoading ? 'opacity-50' : ''}`}
                            >
                                {downloadLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text className="text-center text-sm font-bold">
                                        Download Sample File
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="p-4">
                        {uploadedFiles.length === 0 ? (
                            <View className="py-12 items-center">
                                <Text className="text-gray-500 text-center text-sm mb-4">
                                    There are no uploaded files yet
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setActiveTab('upload')}
                                    className="border border-black px-6 py-2"
                                >
                                    <Text className="text-sm font-medium">Upload Files</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={[...uploadedFiles].reverse()}
                                keyExtractor={(item, index) => `${item.uri}-${index}`}
                                renderItem={renderFile}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}