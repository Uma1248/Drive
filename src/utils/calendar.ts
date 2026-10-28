import { ReviewDocumentData } from '../types';

export function createGoogleCalendarUrl(review: ReviewDocumentData): string {
  const title = encodeURIComponent(`Task Review Session: ${review.projectName}`);
  const details = encodeURIComponent(
    `AI Client Task Deliverable Review & Milestone Sign-Off\n\n` +
      `Client: ${review.clientName}\n` +
      `Overall Score: ${review.overallScore}/100 (${review.verdict})\n` +
      `Google Meet Link: ${review.googleMeetLink}\n\n` +
      `Executive Summary:\n${review.executiveSummary}\n\n` +
      `Agenda:\n` +
      review.meetingAgenda.map((a) => `• ${a.time}: ${a.topic} (${a.objective})`).join('\n')
  );
  const location = encodeURIComponent(review.googleMeetLink);

  // Default to tomorrow 14:00 UTC or parsed scheduled date
  let startIso = review.scheduledIso ? new Date(review.scheduledIso) : new Date();
  if (!review.scheduledIso) {
    startIso.setDate(startIso.getDate() + 1);
    startIso.setHours(14, 0, 0, 0);
  }
  const endIso = new Date(startIso.getTime() + 45 * 60 * 1000); // 45 min duration

  const formatDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const dates = `${formatDate(startIso)}/${formatDate(endIso)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
}

export function downloadIcsFile(review: ReviewDocumentData) {
  let startIso = review.scheduledIso ? new Date(review.scheduledIso) : new Date();
  if (!review.scheduledIso) {
    startIso.setDate(startIso.getDate() + 1);
    startIso.setHours(14, 0, 0, 0);
  }
  const endIso = new Date(startIso.getTime() + 45 * 60 * 1000);

  const formatIcsDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TaskReview Pro//AI Client Task Review System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:taskreview-${Date.now()}@taskreview.pro`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startIso)}`,
    `DTEND:${formatIcsDate(endIso)}`,
    `SUMMARY:Task Review Session: ${review.projectName}`,
    `DESCRIPTION:Formal Client Task Review with AI Reviewer Dr. Elena Vance.\\n\\nGoogle Meet: ${review.googleMeetLink}\\nOverall Score: ${review.overallScore}/100 (${review.verdict})\\n\\n${review.executiveSummary.replace(/\n/g, '\\n')}`,
    `LOCATION:${review.googleMeetLink}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `review-session-${review.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
