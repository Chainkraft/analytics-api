import mailchimp from '@/utils/mailchimp';

class SubscriberService {
  public async addSubscriber(email: string, listId: string): Promise<void> {
    return mailchimp.lists
      .addListMember(listId, {
        email_address: email,
        status: 'subscribed',
      })
      .then(res => {
        mailchimp.lists.updateListMemberTags(listId, res.id, {
          tags: [
            {
              name: 'Alerting',
              status: 'active',
            },
          ],
        });
      });
  }
}

export default SubscriberService;
