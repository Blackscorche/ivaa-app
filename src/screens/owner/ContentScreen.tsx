import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import { ownerAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { colors, gradients, spacing, radius, typography, shadows } from '../../theme';

const FILTERS = ['all', 'pending', 'in_design', 'designed', 'approved', 'published', 'rejected'];

export default function OwnerContentScreen() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchContent = useCallback(async () => {
    try {
      const data = await ownerAPI.getContent();
      setContent(data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchContent(); };

  const filteredContent = filter === 'all' ? content : content.filter(c => c.status === filter);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setShowUploadModal(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      } as any);
      formData.append('playlistScope', 'none');
      if (startDate) formData.append('startDate', startDate);
      if (endDate) formData.append('endDate', endDate);

      await ownerAPI.uploadContent(formData, setUploadProgress);
      setShowUploadModal(false);
      setSelectedFile(null);
      setStartDate('');
      setEndDate('');
      fetchContent();
      Alert.alert('Success', 'Content uploaded successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Upload failed';
      Alert.alert('Upload Failed', msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    inDesign: content.filter(c => ['in_design', 'designed'].includes(c.status)).length,
    rejected: content.filter(c => c.status === 'rejected').length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>My Content</Text>
        <Text style={styles.headerSubtitle}>{content.length} files</Text>
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: colors.primary },
          { label: 'Published', value: stats.published, color: colors.success },
          { label: 'In Design', value: stats.inDesign, color: colors.warning },
          { label: 'Rejected', value: stats.rejected, color: colors.error },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {filteredContent.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No content found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' ? 'Upload your first file to get started' : `No ${filter.replace('_', ' ')} content`}
              </Text>
            </View>
          ) : (
            filteredContent.map(item => (
              <View key={item.id} style={[styles.contentCard, shadows.sm]}>
                <View style={styles.contentCardLeft}>
                  <View style={[styles.fileIcon, {
                    backgroundColor: item.file_type === 'video'
                      ? colors.secondary + '18'
                      : item.file_type === 'pdf'
                      ? colors.error + '18'
                      : colors.primaryFaint,
                  }]}>
                    <Ionicons
                      name={
                        item.file_type === 'video' ? 'videocam' :
                        item.file_type === 'pdf' ? 'document-text' : 'image'
                      }
                      size={22}
                      color={
                        item.file_type === 'video' ? colors.secondary :
                        item.file_type === 'pdf' ? colors.error : colors.primary
                      }
                    />
                  </View>
                  <View style={styles.contentCardInfo}>
                    <Text style={styles.contentCardName} numberOfLines={1}>
                      {item.original_filename}
                    </Text>
                    <Text style={styles.contentCardMeta}>
                      {new Date(item.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {item.was_free_upload ? '  ·  Free upload' : `  ·  £${parseFloat(item.charge_amount || 0).toFixed(2)}`}
                    </Text>
                    {item.rejection_reason && (
                      <Text style={styles.rejectionReason} numberOfLines={2}>
                        ✕ {item.rejection_reason}
                      </Text>
                    )}
                    {(item.start_date || item.end_date) && (
                      <Text style={styles.dateMeta}>
                        {item.start_date ? `From ${item.start_date}` : ''}
                        {item.start_date && item.end_date ? ' – ' : ''}
                        {item.end_date ? `Until ${item.end_date}` : ''}
                      </Text>
                    )}
                  </View>
                </View>
                <StatusBadge status={item.status} />
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, shadows.lg]} onPress={pickFile} activeOpacity={0.85}>
        <LinearGradient colors={gradients.primary} style={styles.fabGradient}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Upload modal */}
      <Modal visible={showUploadModal} transparent animationType="slide" onRequestClose={() => setShowUploadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Upload Content</Text>

            {selectedFile && (
              <View style={styles.selectedFile}>
                <Ionicons name="document-outline" size={20} color={colors.primary} />
                <Text style={styles.selectedFileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileSize}>
                  {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : ''}
                </Text>
              </View>
            )}

            {uploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setShowUploadModal(false); setSelectedFile(null); }}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadButton, uploading && { opacity: 0.7 }]}
                onPress={handleUpload}
                disabled={uploading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={gradients.primary} style={styles.uploadButtonGradient}>
                  {uploading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.uploadButtonText}>Upload</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...typography.headlineMedium, color: colors.white },
  headerSubtitle: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.headlineSmall },
  statLabel: { ...typography.labelSmall, color: colors.textSecondary, marginTop: 2 },
  filterScroll: { maxHeight: 52, backgroundColor: colors.white },
  filterContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { ...typography.labelMedium, color: colors.textSecondary, textTransform: 'capitalize' },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { ...typography.titleLarge, color: colors.textSecondary },
  emptySubtitle: { ...typography.bodyMedium, color: colors.textTertiary, textAlign: 'center' },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  contentCardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, flex: 1 },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCardInfo: { flex: 1 },
  contentCardName: { ...typography.titleSmall, color: colors.textPrimary },
  contentCardMeta: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 3 },
  rejectionReason: { ...typography.bodySmall, color: colors.error, marginTop: 4 },
  dateMeta: { ...typography.bodySmall, color: colors.info, marginTop: 3 },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, borderRadius: radius.full },
  fabGradient: { width: 58, height: 58, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.headlineSmall, color: colors.textPrimary, marginBottom: spacing.lg },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  selectedFileName: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  selectedFileSize: { ...typography.bodySmall, color: colors.textSecondary },
  progressContainer: { marginBottom: spacing.lg },
  progressBar: {
    height: 6, backgroundColor: colors.gray[200],
    borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.xs,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  progressText: { ...typography.labelSmall, color: colors.textSecondary, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  cancelButton: {
    flex: 1, paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: { ...typography.titleSmall, color: colors.textSecondary },
  uploadButton: { flex: 2, borderRadius: radius.md, overflow: 'hidden' },
  uploadButtonGradient: { paddingVertical: spacing.md, alignItems: 'center' },
  uploadButtonText: { ...typography.titleSmall, color: colors.white },
});
