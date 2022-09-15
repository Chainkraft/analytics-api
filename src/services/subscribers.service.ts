import mailchimp from '@/utils/mailchimp';

class SubscriberService {
  public async addSubscriber(email: string, listId: string): Promise<void> {
    const addEmail = await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: 'subscribed',
    });

    await mailchimp.lists.updateListMemberTags(listId, addEmail.id, {
      tags: [
        {
          name: 'Alerting',
          status: 'active',
        },
      ],
    });
  }
}

export default SubscriberService;
