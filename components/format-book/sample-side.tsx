import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";

interface BookSection {
  id: string;
  title: string;
  type: "FrontMatter" | "Chapter" | "Part" | "EndMatter";
  parentId: string | null;
  order: number;
}

interface SidebarProps {
  bookId: string;
  activeSectionId?: string;
  onSectionSelect: (id: string) => void;
}

export default function Sidebar({
  bookId,
  activeSectionId,
  onSectionSelect,
}: SidebarProps) {
  const [sections, setSections] = useState<BookSection[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    axios
      .get(`/api/book-sections?bookId=${bookId}`)
      .then((res) => setSections(res.data))
      .catch(console.error);
  }, [bookId]);

  const grouped = {
    FrontMatter: sections.filter((s) => s.type === "FrontMatter"),
    Chapters: sections.filter((s) => s.type === "Chapter"),
    Parts: (chapterId: string) =>
      sections.filter((s) => s.parentId === chapterId),
    EndMatter: sections.filter((s) => s.type === "EndMatter"),
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handleAdd = async (
    type: BookSection["type"],
    parentId: string | null = null
  ) => {
    const res = await axios.post("/api/book-section", {
      bookProjectId: bookId,
      title: `${type} ${sections.length + 1}`,
      type,
      parentId,
    });
    setSections([...sections, res.data]);
  };

  return (
    <aside className="w-72 bg-white m-16 border-r h-full overflow-y-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Book Sections</h2>

      <Group title="Front Matter">
        {grouped.FrontMatter.map((s) => (
          <SectionItem
            key={s.id}
            section={s}
            active={activeSectionId === s.id}
            onClick={onSectionSelect}
          />
        ))}
        <AddButton onClick={() => handleAdd("FrontMatter")}>
          Add Front Matter
        </AddButton>
      </Group>

      <Group title="Chapters">
        {grouped.Chapters.map((ch) => (
          <div key={ch.id}>
            <div className="flex items-center">
              <button onClick={() => toggleChapter(ch.id)}>
                {expandedChapters.has(ch.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <SectionItem
                section={ch}
                active={activeSectionId === ch.id}
                onClick={onSectionSelect}
              />
            </div>
            {expandedChapters.has(ch.id) && (
              <div className="ml-4">
                {grouped.Parts(ch.id).map((p) => (
                  <SectionItem
                    key={p.id}
                    section={p}
                    active={activeSectionId === p.id}
                    onClick={onSectionSelect}
                  />
                ))}
                <AddButton onClick={() => handleAdd("Part", ch.id)}>
                  Add Part
                </AddButton>
              </div>
            )}
          </div>
        ))}
        <AddButton onClick={() => handleAdd("Chapter")}>Add Chapter</AddButton>
      </Group>

      <Group title="End Matter">
        {grouped.EndMatter.map((s) => (
          <SectionItem
            key={s.id}
            section={s}
            active={activeSectionId === s.id}
            onClick={onSectionSelect}
          />
        ))}
        <AddButton onClick={() => handleAdd("EndMatter")}>
          Add End Matter
        </AddButton>
      </Group>
    </aside>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SectionItem({
  section,
  active,
  onClick,
}: {
  section: BookSection;
  active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(section.id)}
      className={cn("w-full text-left px-2 py-1 rounded hover:bg-gray-100", {
        "bg-gray-200 font-medium": active,
      })}
    >
      {section.title}
    </button>
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-sm text-blue-600 hover:underline mt-1"
    >
      <Plus size={14} className="mr-1" /> {children}
    </button>
  );
}
