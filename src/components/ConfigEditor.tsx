import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  TextArea,
  Tile,
  Heading,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  InlineNotification
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Section {
  id: string;
  name: string;
  color?: string;
  displayOrder: number;
}

interface Problem {
  id: number;
  title: string;
  displayOrder: number;
}

export const ConfigEditor: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionColor, setSectionColor] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/config/sections`);
      const data = await response.json();
      setSections(data);
    } catch (err: any) {
      setError('Failed to load sections');
    }
  };

  const loadProblems = async (sectionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/config/sections/${sectionId}/problems`);
      const data = await response.json();
      setProblems(data);
    } catch (err: any) {
      setError('Failed to load problems');
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadProblems(selectedSection.id);
    }
  }, [selectedSection]);

  const handleAddSection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/config/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `section-${Date.now()}`,
          name: sectionName,
          color: sectionColor || null,
          displayOrder: sections.length,
          configId: 'config-default' // You'll need to get the active config ID
        })
      });
      
      if (response.ok) {
        setSuccess('Section added successfully');
        loadSections();
        setShowSectionModal(false);
        setSectionName('');
        setSectionColor('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to add section');
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/config/sections/${editingSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sectionName,
          color: sectionColor || null
        })
      });
      
      if (response.ok) {
        setSuccess('Section updated successfully');
        loadSections();
        setShowSectionModal(false);
        setEditingSection(null);
        setSectionName('');
        setSectionColor('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Delete this section and all its problems?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/config/sections/${sectionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSuccess('Section deleted');
        loadSections();
        if (selectedSection?.id === sectionId) {
          setSelectedSection(null);
          setProblems([]);
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to delete section');
    }
  };

  const handleAddProblem = async () => {
    if (!selectedSection) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/config/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now(),
          sectionId: selectedSection.id,
          title: problemTitle,
          displayOrder: problems.length
        })
      });
      
      if (response.ok) {
        setSuccess('Problem added successfully');
        loadProblems(selectedSection.id);
        setShowProblemModal(false);
        setProblemTitle('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to add problem');
    }
  };

  const handleUpdateProblem = async () => {
    if (!editingProblem || !selectedSection) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/config/problems/${editingProblem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: problemTitle
        })
      });
      
      if (response.ok) {
        setSuccess('Problem updated successfully');
        loadProblems(selectedSection.id);
        setShowProblemModal(false);
        setEditingProblem(null);
        setProblemTitle('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to update problem');
    }
  };

  const handleDeleteProblem = async (problemId: number) => {
    if (!window.confirm('Delete this problem?')) return;
    if (!selectedSection) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/config/problems/${problemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSuccess('Problem deleted');
        loadProblems(selectedSection.id);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to delete problem');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Heading style={{ marginBottom: '0.5rem' }}>
          Survey Configuration
        </Heading>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          Manage survey sections and problems. Changes take effect immediately for all new surveys.
        </p>
      </div>

      {success && (
        <InlineNotification
          kind="success"
          lowContrast
          hideCloseButton
          title="Success"
          subtitle={success}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {error && (
        <InlineNotification
          kind="error"
          lowContrast
          onClose={() => setError('')}
          title="Error"
          subtitle={error}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Sections Panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Heading style={{ fontSize: '1.125rem' }}>Sections</Heading>
            <Button
              size="sm"
              renderIcon={Add}
              onClick={() => {
                setEditingSection(null);
                setSectionName('');
                setSectionColor('');
                setShowSectionModal(true);
              }}
            >
              Add Section
            </Button>
          </div>

          {sections.length > 0 ? (
            <div style={{ 
              backgroundColor: '#262626',
              border: '1px solid #393939',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <Table size="sm">
                <TableHead>
                  <TableRow>
                    <TableHeader>Section Name</TableHeader>
                    <TableHeader>Color</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow 
                      key={section.id}
                      onClick={() => setSelectedSection(section)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedSection?.id === section.id ? '#393939' : 'transparent'
                      }}
                    >
                      <TableCell>{section.name}</TableCell>
                      <TableCell>
                        {section.color && (
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            backgroundColor: section.color,
                            borderRadius: '4px'
                          }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            size="sm"
                            kind="ghost"
                            renderIcon={Edit}
                            hasIconOnly
                            iconDescription="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSection(section);
                              setSectionName(section.name);
                              setSectionColor(section.color || '');
                              setShowSectionModal(true);
                            }}
                          />
                          <Button
                            size="sm"
                            kind="ghost"
                            renderIcon={TrashCan}
                            hasIconOnly
                            iconDescription="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(section.id);
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Tile style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ opacity: 0.7 }}>No sections yet. Add your first section.</p>
            </Tile>
          )}
        </div>

        {/* Problems Panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Heading style={{ fontSize: '1.125rem' }}>
              {selectedSection ? `Problems - ${selectedSection.name}` : 'Problems'}
            </Heading>
            {selectedSection && (
              <Button
                size="sm"
                renderIcon={Add}
                onClick={() => {
                  setEditingProblem(null);
                  setProblemTitle('');
                  setShowProblemModal(true);
                }}
              >
                Add Problem
              </Button>
            )}
          </div>

          {selectedSection ? (
            problems.length > 0 ? (
              <div style={{ 
                backgroundColor: '#262626',
                border: '1px solid #393939',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <Table size="sm">
                  <TableHead>
                    <TableRow>
                      <TableHeader>ID</TableHeader>
                      <TableHeader>Problem Title</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {problems.map((problem) => (
                      <TableRow key={problem.id}>
                        <TableCell>{problem.id}</TableCell>
                        <TableCell>{problem.title}</TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                              size="sm"
                              kind="ghost"
                              renderIcon={Edit}
                              hasIconOnly
                              iconDescription="Edit"
                              onClick={() => {
                                setEditingProblem(problem);
                                setProblemTitle(problem.title);
                                setShowProblemModal(true);
                              }}
                            />
                            <Button
                              size="sm"
                              kind="ghost"
                              renderIcon={TrashCan}
                              hasIconOnly
                              iconDescription="Delete"
                              onClick={() => handleDeleteProblem(problem.id)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ opacity: 0.7 }}>No problems in this section. Add your first problem.</p>
              </Tile>
            )
          ) : (
            <Tile style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ opacity: 0.7 }}>Select a section to view its problems.</p>
            </Tile>
          )}
        </div>
      </div>

      {/* Section Modal */}
      <Modal
        open={showSectionModal}
        onRequestClose={() => {
          setShowSectionModal(false);
          setEditingSection(null);
          setSectionName('');
          setSectionColor('');
        }}
        modalHeading={editingSection ? 'Edit Section' : 'Add New Section'}
        primaryButtonText={editingSection ? 'Update' : 'Add'}
        secondaryButtonText="Cancel"
        onRequestSubmit={editingSection ? handleUpdateSection : handleAddSection}
      >
        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="section-name"
            labelText="Section Name"
            placeholder="e.g., Query Performance & Tuning"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
          />
        </div>
        <div>
          <TextInput
            id="section-color"
            labelText="Color (Hex)"
            placeholder="#3b82f6 (optional)"
            value={sectionColor}
            onChange={(e) => setSectionColor(e.target.value)}
          />
        </div>
      </Modal>

      {/* Problem Modal */}
      <Modal
        open={showProblemModal}
        onRequestClose={() => {
          setShowProblemModal(false);
          setEditingProblem(null);
          setProblemTitle('');
        }}
        modalHeading={editingProblem ? 'Edit Problem' : 'Add New Problem'}
        primaryButtonText={editingProblem ? 'Update' : 'Add'}
        secondaryButtonText="Cancel"
        onRequestSubmit={editingProblem ? handleUpdateProblem : handleAddProblem}
        size="lg"
      >
        <div>
          <TextArea
            id="problem-title"
            labelText="Problem Title"
            placeholder="Describe the problem..."
            value={problemTitle}
            onChange={(e) => setProblemTitle(e.target.value)}
            rows={4}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

