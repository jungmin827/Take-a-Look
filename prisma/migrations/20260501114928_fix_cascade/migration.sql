-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TagsOnEssays" (
    "essayId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("essayId", "tagId"),
    CONSTRAINT "TagsOnEssays_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagsOnEssays_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TagsOnEssays" ("essayId", "tagId") SELECT "essayId", "tagId" FROM "TagsOnEssays";
DROP TABLE "TagsOnEssays";
ALTER TABLE "new_TagsOnEssays" RENAME TO "TagsOnEssays";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
