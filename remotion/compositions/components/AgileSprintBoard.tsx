import React from 'react';
import { interpolate } from 'remotion';
import { SDLP_ABOUT_COLORS } from '../../types/constants';

const C = SDLP_ABOUT_COLORS.scene3;

interface CardDef {
  label: string;
  column: number; // 0=todo, 1=progress, 2=done
  enterDelay: number;
  moveToNext?: number; // frame to start moving to next column
}

const KANBAN_CARDS: CardDef[] = [
  { label: 'UI設計', column: 2, enterDelay: 0 },
  { label: 'API開発', column: 1, enterDelay: 4, moveToNext: 45 },
  { label: 'DB設計', column: 2, enterDelay: 8 },
  { label: 'テスト', column: 0, enterDelay: 12, moveToNext: 35 },
  { label: 'AI連携', column: 1, enterDelay: 16 },
  { label: 'デプロイ', column: 0, enterDelay: 20 },
];

const COLUMNS = [
  { title: 'ToDo', color: C.todo, x: 80 },
  { title: 'In Progress', color: C.progress, x: 310 },
  { title: 'Done', color: C.done, x: 540 },
];

const COLUMN_WIDTH = 190;
const CARD_HEIGHT = 36;

export const AgileSprintBoard: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  if (opacity <= 0) return null;

  return (
    <div style={{ opacity, position: 'absolute', inset: 0 }}>
      <SceneTitle frame={frame} />
      <ColumnHeaders frame={frame} />
      <KanbanCards frame={frame} />
      <AiCursor frame={frame} />
      <SprintProgressBar frame={frame} />
    </div>
  );
};

const SceneTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [0, 12], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 25,
        width: '100%',
        textAlign: 'center',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: SDLP_ABOUT_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 2,
        }}
      >
        AGILE AI DEVELOPMENT
      </span>
      <div
        style={{
          marginTop: 6,
          width: 50,
          height: 2,
          background: `linear-gradient(90deg, ${C.sprint}, ${C.done})`,
          borderRadius: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
};

const ColumnHeaders: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {COLUMNS.map((col, i) => {
        const opacity = interpolate(frame, [5 + i * 3, 12 + i * 3], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const cardCount = KANBAN_CARDS.filter((c) => {
          if (c.moveToNext && frame > c.moveToNext + 15) {
            return c.column + 1 === i;
          }
          return c.column === i;
        }).length;

        return (
          <div
            key={col.title}
            style={{
              position: 'absolute',
              left: col.x,
              top: 75,
              width: COLUMN_WIDTH,
              opacity,
            }}
          >
            {/* Column header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px 10px 0 0',
                background: `${col.color}15`,
                borderBottom: `2px solid ${col.color}40`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: col.color,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {col.title}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: SDLP_ABOUT_COLORS.text.muted,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  background: SDLP_ABOUT_COLORS.bg.card,
                  padding: '2px 6px',
                  borderRadius: 8,
                }}
              >
                {cardCount}
              </span>
            </div>

            {/* Column body */}
            <div
              style={{
                minHeight: 200,
                background: `${SDLP_ABOUT_COLORS.bg.card}80`,
                borderRadius: '0 0 10px 10px',
                border: `1px solid ${col.color}15`,
                borderTop: 'none',
              }}
            />
          </div>
        );
      })}
    </>
  );
};

const KanbanCards: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <>
      {KANBAN_CARDS.map((card, idx) => {
        const enterFrame = 10 + card.enterDelay;
        const cardOpacity = interpolate(
          frame,
          [enterFrame, enterFrame + 8],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        // Determine current column position
        let currentCol = card.column;
        let moveProgress = 0;

        if (card.moveToNext && frame > card.moveToNext) {
          moveProgress = interpolate(
            frame,
            [card.moveToNext, card.moveToNext + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          if (moveProgress >= 1) {
            currentCol = card.column + 1;
          }
        }

        const fromX = COLUMNS[card.column].x + 8;
        const toX = COLUMNS[Math.min(card.column + 1, 2)].x + 8;
        const cardX = card.moveToNext
          ? fromX + (toX - fromX) * moveProgress
          : COLUMNS[currentCol].x + 8;

        // Stack cards within columns
        const cardsInSameCol = KANBAN_CARDS.filter((c, ci) => {
          const cCol =
            c.moveToNext && frame > c.moveToNext + 15 ? c.column + 1 : c.column;
          const thisCol =
            card.moveToNext && frame > card.moveToNext + 15
              ? card.column + 1
              : card.column;
          return cCol === thisCol && ci < idx;
        });
        const cardYOffset = cardsInSameCol.length * (CARD_HEIGHT + 8);

        const isMoving = card.moveToNext && moveProgress > 0 && moveProgress < 1;
        const columnColor = COLUMNS[currentCol]?.color ?? C.todo;

        return (
          <div
            key={card.label}
            style={{
              position: 'absolute',
              left: cardX,
              top: 116 + cardYOffset,
              width: COLUMN_WIDTH - 16,
              height: CARD_HEIGHT,
              borderRadius: 8,
              background: SDLP_ABOUT_COLORS.bg.mid,
              border: `1px solid ${isMoving ? C.aiCursor : columnColor}40`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 10,
              paddingRight: 10,
              gap: 6,
              opacity: cardOpacity,
              boxShadow: isMoving ? `0 0 12px ${C.aiCursor}40` : 'none',
              transition: 'box-shadow 0.3s',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: columnColor,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: SDLP_ABOUT_COLORS.text.primary,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {card.label}
            </span>
            {currentCol === 2 && (
              <span
                style={{ fontSize: 10, marginLeft: 'auto', color: C.done }}
              >
                ✓
              </span>
            )}
          </div>
        );
      })}
    </>
  );
};

const AiCursor: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 30 || frame > 70) return null;

  const progress = interpolate(frame, [30, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cursor moves across the board
  const cursorX = interpolate(progress, [0, 0.5, 1], [200, 420, 620]);
  const cursorY = interpolate(progress, [0, 0.5, 1], [200, 180, 160]);

  const pulse = interpolate(frame % 15, [0, 7, 15], [0.8, 1.2, 0.8]);

  return (
    <div
      style={{
        position: 'absolute',
        left: cursorX,
        top: cursorY,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: `${C.aiCursor}40`,
        border: `2px solid ${C.aiCursor}`,
        transform: `scale(${pulse})`,
        boxShadow: `0 0 12px ${C.aiCursor}60`,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: -16,
          left: 20,
          fontSize: 9,
          fontWeight: 700,
          color: C.aiCursor,
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        AI assist
      </span>
    </div>
  );
};

const SprintProgressBar: React.FC<{ frame: number }> = ({ frame }) => {
  const barOpacity = interpolate(frame, [25, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const progress = interpolate(frame, [35, 80], [0.3, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 35,
        left: 80,
        right: 80,
        opacity: barOpacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: SDLP_ABOUT_COLORS.text.secondary,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Sprint Progress
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.sprint,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: `${SDLP_ABOUT_COLORS.bg.card}`,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(90deg, ${C.sprint}, ${C.done})`,
            boxShadow: `0 0 8px ${C.sprint}40`,
          }}
        />
      </div>
    </div>
  );
};
