import React, { useState } from 'react';
import EditExerciseModal from '@/components/EditExerciseModal';

export default function WorkoutSession() {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      {showEditModal && (
        <EditExerciseModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          exercise={exercise}
          onUpdate={async () => {
            setShowEditModal(false);
            await loadExerciseSession();
          }}
        />
      )}
    </>
  );
}