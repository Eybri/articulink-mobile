import React from 'react'
import { Button, H1, H2, Paragraph, Separator, XStack, YStack, Card, Switch, Label, Spinner } from 'tamagui'
import { ChevronRight, Star, Heart, Mic } from '@tamagui/lucide-icons'

export default function TamaguiDemoScreen() {
  return (
    <YStack f={1} p="$4" gap="$4" bg="$background">
      <YStack gap="$2">
        <H1>Tamagui Demo</H1>
        <Paragraph color="$colorHover">
          This screen demonstrates Tamagui components in Articulink.
        </Paragraph>
      </YStack>

      <Separator />

      <H2 size="$6">Buttons & Stacks</H2>
      <XStack gap="$2" fw="wrap">
        <Button theme="blue" icon={Star}>Primary</Button>
        <Button theme="green" variant="outline">Outline</Button>
        <Button theme="red" circular icon={Heart} />
        <Button size="$6" theme="orange">Large</Button>
      </XStack>

      <H2 size="$6">Cards</H2>
      <XStack gap="$4" fw="wrap">
        <Card elevation={5} size="$4" bw={1} bc="$borderColor" w={200} h={150} scale={0.9} hoverStyle={{ scale: 0.92 }} pressStyle={{ scale: 0.88 }}>
          <Card.Header padding="$4">
            <H2 size="$4">Card Title</H2>
            <Paragraph theme="alt2">Subtitle here</Paragraph>
          </Card.Header>
          <Card.Footer padding="$4">
            <XStack f={1} />
            <Button borderRadius="$10">Go</Button>
          </Card.Footer>
          <Card.Background>
            {/* You could add an image here */}
          </Card.Background>
        </Card>

        <Card elevation={5} size="$4" bw={1} bc="$borderColor" w={200} h={150} theme="dark">
          <Card.Header padding="$4">
            <H2 size="$4">Dark Card</H2>
            <Paragraph theme="alt1">Dark theme support</Paragraph>
          </Card.Header>
          <Card.Footer padding="$4">
            <Button icon={Mic} circular />
          </Card.Footer>
        </Card>
      </XStack>

      <H2 size="$6">Forms & Feedback</H2>
      <XStack gap="$4" ai="center">
        <Label htmlFor="demo-switch">Enable Feature</Label>
        <Switch id="demo-switch" size="$4" theme="blue">
          <Switch.Thumb />
        </Switch>
      </XStack>

      <XStack gap="$4" ai="center">
        <Paragraph>Loading state:</Paragraph>
        <Spinner size="large" color="$blue10" />
      </XStack>

      <Button
        mt="$4"
        iconAfter={ChevronRight}
        themeInverse
        onPress={() => alert('Tamagui is awesome!')}
      >
        Click Me
      </Button>
    </YStack>
  )
}
