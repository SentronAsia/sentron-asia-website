import ContentManager from '../../features/admin/ContentManager.jsx';
import {
  adminFetchStories, adminCreateStory,
  adminUpdateStory, adminDeleteStory,
} from '../../api/services';

const columns = [
  {
    key: 'coverImage', label: '',
    render: (item) => item.coverImage
      ? <img src={item.coverImage} alt="" style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
      : <div style={{ width: 44, height: 32, background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }} />,
  },
  { key: 'title', label: 'Title' },
  { key: 'brand', label: 'Brand', render: (item) => item.brand?.name || item.brandId || '–' },
  { key: 'sections', label: 'Sections', render: (item) => item.sections?.length || 0 },
];

const formFields = [
  { key: 'title', label: 'Story Title', required: true },
  { key: 'brandId', label: 'Brand ID', required: true, placeholder: 'MongoDB ObjectId' },
  { key: 'coverImage', label: 'Cover Image', type: 'image' },
  { key: 'researcherName', label: 'Researcher Name' },
  { key: 'institution', label: 'Institution' },
  { key: 'studyTitle', label: 'Study Title' },
  { key: 'applicationField', label: 'Application Field' },
  { key: 'abstract', label: 'Abstract', type: 'textarea' },
  { key: 'imageUrl', label: 'Research Image URL', type: 'image' },
];

export default function StoriesManager() {
  return (
    <ContentManager
      title="Showcase Stories"
      queryKey="admin-stories"
      fetchFn={adminFetchStories}
      createFn={adminCreateStory}
      updateFn={adminUpdateStory}
      deleteFn={adminDeleteStory}
      columns={columns}
      formFields={formFields}
      defaultForm={{
        title: '',
        brandId: '',
        coverImage: '',
        researcherName: '',
        institution: '',
        studyTitle: '',
        applicationField: '',
        abstract: '',
        imageUrl: '',
        sections: [],
      }}
    />
  );
}
