type ProjectIdentity = {
  id: string;
  title: string;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  due: string;
};

export type Collaborator = {
  id: string;
  name: string;
  role: string;
  color: string;
};

export type ProjectDetails = {
  tasks: Task[];
  collaborators: Collaborator[];
};

const TASK_LIBRARY = [
  'Scope requirements',
  'Design wireframes',
  'API endpoints',
  'Integrate auth',
  'QA pass',
  'Deploy build',
  'Feedback review',
  'Docs & onboarding',
];

const DUE_LABELS = ['Today', 'Tomorrow', 'Fri', 'Mon', 'Next wk'];

const COLLAB_LIBRARY: Collaborator[] = [
  { id: 'c1', name: 'Amaka Dan', role: 'Design', color: '#7C3AED' },
  { id: 'c2', name: 'Jonas Lee', role: 'Backend', color: '#2563EB' },
  { id: 'c3', name: 'Ruth K.', role: 'Research', color: '#F97316' },
  { id: 'c4', name: 'Tari M.', role: 'QA', color: '#10B981' },
  { id: 'c5', name: 'Maya C.', role: 'Product', color: '#EC4899' },
  { id: 'c6', name: 'Dara F.', role: 'Mobile', color: '#0EA5E9' },
];

function seedFromString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
}

export function buildProjectDetails(project: ProjectIdentity): ProjectDetails {
  const seed = seedFromString(`${project.id}-${project.title}`);
  const taskCount = 3 + (seed % 3);
  const collabCount = 2 + (seed % 3);

  const tasks: Task[] = Array.from({ length: taskCount }).map((_, index) => ({
    id: `${project.id}-task-${index}`,
    title: TASK_LIBRARY[(seed + index) % TASK_LIBRARY.length],
    due: DUE_LABELS[(seed + index) % DUE_LABELS.length],
    done: (seed + index) % 3 === 0,
  }));

  const collaborators: Collaborator[] = Array.from({ length: collabCount }).map((_, index) => {
    const base = COLLAB_LIBRARY[(seed + index) % COLLAB_LIBRARY.length];
    return { ...base, id: `${project.id}-${base.id}` };
  });

  return { tasks, collaborators };
}

export function getProgress(tasks: Task[]) {
  if (tasks.length === 0) {
    return 0;
  }
  const completed = tasks.filter((task) => task.done).length;
  return Math.round((completed / tasks.length) * 100);
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
