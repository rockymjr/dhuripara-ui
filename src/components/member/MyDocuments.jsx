import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';
import { formatDate } from '../../utils/dateFormatter';
import Loader from '../common/Loader';
import { FileText, Download, Image, File } from 'lucide-react';
import StyledTable from '../common/StyledTable';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState('');
  const [docViewerTitle, setDocViewerTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMyDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const blob = await memberService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  const handleView = async (documentId) => {
    try {
      const res = await memberService.getDocumentUrl(documentId);
      const url = res?.url || res;
      if (url) {
        setDocViewerUrl(url);
        setDocViewerTitle('Document');
        setShowDocViewer(true);
      } else {
        alert('Failed to fetch document URL');
      }
    } catch (err) {
      console.error('Error getting document URL:', err);
      alert('Failed to open document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (contentType) => {
    if (contentType?.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    }
    return <File size={20} className="text-red-500" />;
  };

  if (loading) return <Loader message="Loading documents..." />;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FileText className="mr-2" size={28} />
          My Documents
        </h2>
        <p className="text-gray-600 mt-1">View and download your uploaded documents</p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No documents found</p>
          <p className="text-sm text-gray-500 mt-2">Documents uploaded by admin will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <StyledTable
            renderHeader={() => (
              <>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">File Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Uploaded</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Notes</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
              </>
            )}
          >
            {documents.map((doc) => (
              <tr key={doc.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {doc.documentCategoryName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(doc.contentType)}
                    <span className="text-sm font-medium text-gray-900">{doc.originalFileName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFileSize(doc.fileSize)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(doc.uploadedAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {doc.notes || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(doc.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id, doc.originalFileName)}
                      className="text-green-600 hover:text-green-900"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </StyledTable>
        </div>
      )}
      {/* Document Viewer Modal */}
      {showDocViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowDocViewer(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 md:w-3/4 lg:w-4/5 max-h-[90vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{docViewerTitle}</h3>
              <button className="text-gray-600" onClick={() => setShowDocViewer(false)}>Close</button>
            </div>
            <div className="w-full h-[80vh]">
              <iframe title={docViewerTitle} src={docViewerUrl} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;

