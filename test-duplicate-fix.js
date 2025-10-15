// Test script to verify duplicate notification fix
console.log('🧪 DUPLICATE NOTIFICATION FIX TEST');
console.log('=====================================');

// Simulate the deduplication logic
class NotificationDeduplicator {
  constructor() {
    this.processedMessages = new Set();
    this.recentNotifications = new Map();
  }

  createMessageId(message) {
    return `${message.type}-${message.data?.tradeId || message.data?.id || 'unknown'}-${message.data?.userId || 'unknown'}-${message.data?.timestamp || Date.now()}`;
  }

  isMessageProcessed(messageId) {
    return this.processedMessages.has(messageId);
  }

  markMessageProcessed(messageId) {
    this.processedMessages.add(messageId);
    
    // Clean up old messages (keep only last 50)
    if (this.processedMessages.size > 100) {
      const messagesArray = Array.from(this.processedMessages);
      const toKeep = messagesArray.slice(-50);
      this.processedMessages = new Set(toKeep);
      console.log('🧹 Cleaned up processed messages cache');
    }
  }

  canTriggerNotification(tradeId) {
    const now = Date.now();
    const lastNotificationTime = this.recentNotifications.get(tradeId);
    
    if (lastNotificationTime && (now - lastNotificationTime) < 5000) {
      console.log(`🔔 Duplicate notification prevented for trade: ${tradeId}, Last notification was ${now - lastNotificationTime}ms ago`);
      return false;
    }

    // Record this notification
    this.recentNotifications.set(tradeId, now);

    // Clean up old entries (keep only last 10 minutes)
    const tenMinutesAgo = now - (10 * 60 * 1000);
    for (const [id, timestamp] of this.recentNotifications.entries()) {
      if (timestamp < tenMinutesAgo) {
        this.recentNotifications.delete(id);
      }
    }

    return true;
  }
}

// Test the deduplication logic
const deduplicator = new NotificationDeduplicator();

// Simulate the same trade completion message being received multiple times
const testMessage = {
  type: 'trade_completed',
  data: {
    tradeId: 'e5155d00-6f62-4bf7-8ba6-b18602a71771',
    userId: '3bc475a8-47bb-452d-9c3a-0308fe8688d1',
    result: 'lose',
    exitPrice: 65316.66435344419,
    profitAmount: -100,
    newBalance: 56382,
    timestamp: '2025-10-15T10:49:55.960Z'
  }
};

console.log('\n🧪 TEST 1: First message processing');
const messageId1 = deduplicator.createMessageId(testMessage);
console.log('Message ID:', messageId1);
console.log('Is processed?', deduplicator.isMessageProcessed(messageId1));
console.log('Can trigger notification?', deduplicator.canTriggerNotification(testMessage.data.tradeId));

if (!deduplicator.isMessageProcessed(messageId1)) {
  deduplicator.markMessageProcessed(messageId1);
  console.log('✅ Message processed by MAIN handler');
}

console.log('\n🧪 TEST 2: Duplicate message (same timestamp)');
const messageId2 = deduplicator.createMessageId(testMessage);
console.log('Message ID:', messageId2);
console.log('Is processed?', deduplicator.isMessageProcessed(messageId2));
console.log('Can trigger notification?', deduplicator.canTriggerNotification(testMessage.data.tradeId));

if (deduplicator.isMessageProcessed(messageId2)) {
  console.log('✅ Duplicate message correctly blocked');
} else {
  console.log('❌ Duplicate message NOT blocked - this is a bug!');
}

console.log('\n🧪 TEST 3: Same trade ID but different timestamp');
const testMessage2 = {
  ...testMessage,
  data: {
    ...testMessage.data,
    timestamp: '2025-10-15T10:49:56.027Z' // Different timestamp
  }
};

const messageId3 = deduplicator.createMessageId(testMessage2);
console.log('Message ID:', messageId3);
console.log('Is processed?', deduplicator.isMessageProcessed(messageId3));
console.log('Can trigger notification?', deduplicator.canTriggerNotification(testMessage2.data.tradeId));

if (deduplicator.isMessageProcessed(messageId3)) {
  console.log('✅ Different timestamp message correctly blocked by message deduplication');
} else if (!deduplicator.canTriggerNotification(testMessage2.data.tradeId)) {
  console.log('✅ Different timestamp message correctly blocked by notification deduplication');
} else {
  console.log('❌ Different timestamp message NOT blocked - this is a bug!');
}

console.log('\n🧪 TEST 4: Wait 6 seconds and try again (should allow)');
setTimeout(() => {
  console.log('After 6 seconds...');
  console.log('Can trigger notification?', deduplicator.canTriggerNotification(testMessage.data.tradeId));
  
  console.log('\n✅ DUPLICATE NOTIFICATION FIX TEST COMPLETE');
  console.log('The fix should prevent:');
  console.log('1. Same message being processed multiple times (message deduplication)');
  console.log('2. Multiple notifications for same trade within 5 seconds (notification deduplication)');
}, 6000);
