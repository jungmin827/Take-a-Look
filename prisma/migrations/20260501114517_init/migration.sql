-- CreateTable
CREATE TABLE "Essay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "readingTime" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TagsOnEssays" (
    "essayId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("essayId", "tagId"),
    CONSTRAINT "TagsOnEssays_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagsOnEssays_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "essayId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Essay_slug_key" ON "Essay"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
